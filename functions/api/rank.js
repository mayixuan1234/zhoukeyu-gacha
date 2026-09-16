// ===== 抽卡排行榜 API（Cloudflare Pages Functions + KV）=====
// 2026-09-16 新增：让「排行榜是增长引擎」落地
// 前端通过 GET /api/rank 拉取榜单，POST /api/rank 上报自己的抽数
// KV 绑定名：RANK_KV（需在 Cloudflare 面板绑定 KV namespace，见 README）

const MAX_DRAWS = 200000; // 防造假上限：略高于全站总抽数 111801，超过即拒绝
const NICKNAME_MAX = 12; // 昵称最长 12 字符
const TOP_N = 50; // 榜单返回条数
const TTL = 90 * 24 * 3600; // 记录保留 90 天（活动结束后自然过期）

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store'
    }
  });
}

// 读取 KV 中所有有效榜单条目
async function loadAllEntries(kv) {
  const entries = [];
  let cursor;
  do {
    const opts = { limit: 1000 };
    if (cursor) opts.cursor = cursor;
    const list = await kv.list(opts);
    for (const key of list.keys) {
      if (!key.name.startsWith('u:')) continue;
      const raw = await kv.get(key.name);
      if (!raw) continue;
      try {
        const item = JSON.parse(raw);
        if (item && typeof item.draws === 'number') {
          entries.push({
            nickname: String(item.nickname || '匿名'),
            draws: Math.floor(item.draws),
            updatedAt: item.updatedAt || 0
          });
        }
      } catch (_) { /* 跳过损坏条目 */ }
    }
    cursor = list.cursor;
  } while (cursor);
  return entries;
}

export async function onRequest(context) {
  const { request, env } = context;
  const kv = env.RANK_KV;

  if (request.method === 'OPTIONS') {
    return json({ success: true }, 204);
  }

  if (request.method === 'GET') {
    try {
      const entries = await loadAllEntries(kv);
      entries.sort((a, b) => b.draws - a.draws || (a.updatedAt || 0) - (b.updatedAt || 0));
      return json({ success: true, list: entries.slice(0, TOP_N), total: entries.length });
    } catch (e) {
      return json({ success: false, message: '读取排行榜失败' }, 500);
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const uid = String(body.uid || '').trim();
      const nickname = String(body.nickname || '').trim().slice(0, NICKNAME_MAX);
      const draws = Number(body.draws);

      if (!uid || uid.length > 64) {
        return json({ success: false, message: '无效的用户标识' }, 400);
      }
      if (!nickname) {
        return json({ success: false, message: '请先设置昵称再上报' }, 400);
      }
      if (!Number.isFinite(draws) || draws <= 0 || draws > MAX_DRAWS) {
        return json({ success: false, message: '抽数超出合理范围，请检查数据是否真实' }, 400);
      }

      const record = { nickname, draws: Math.floor(draws), updatedAt: Date.now() };
      await kv.put('u:' + uid, JSON.stringify(record), { expirationTtl: TTL });

      // 计算我的当前排名（同分按先上榜者优先）
      const entries = await loadAllEntries(kv);
      let rank = 1;
      for (const item of entries) {
        if (item.draws > record.draws) rank++;
      }
      return json({ success: true, rank, total: entries.length });
    } catch (e) {
      return json({ success: false, message: '上报失败，请重试' }, 500);
    }
  }

  return json({ success: false, message: '不支持的方法' }, 405);
}
