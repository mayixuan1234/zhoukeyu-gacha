export async function onRequestGet(context) {
  try {
    const response = await fetch('https://www.91ruyu.com/gaia/85014/bad3126a.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    const html = await response.text()

    // 尝试多种匹配模式
    let draws = null

    // 模式1: 已抽XXXX个
    const match1 = html.match(/已抽(\d+)个/)
    if (match1) draws = parseInt(match1[1])

    // 模式2: 总抽数 破 XXXXX
    if (!draws) {
      const match2 = html.match(/总抽数[\s\S]*?破\s*(\d+)/)
      if (match2) draws = parseInt(match2[1])
    }

    // 模式3: 直接匹配 破 XXXXX
    if (!draws) {
      const match3 = html.match(/破\s*(\d{4,})/)
      if (match3) draws = parseInt(match3[1])
    }

    if (draws) {
      return new Response(JSON.stringify({
        success: true,
        draws,
        timestamp: Date.now()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=300'
        }
      })
    }

    return new Response(JSON.stringify({
      success: false,
      message: '未找到抽数信息'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
