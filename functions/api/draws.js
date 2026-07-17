export async function onRequestGet(context) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'https://www.91ruyu.com/gaia/85014/bad3126a.html'
  }

  try {
    // Step 1: Get the API endpoint URL
    const step1Data = 'param=' + encodeURIComponent(JSON.stringify({ flow: 'mystery_box_main_page' }))
    const step1Resp = await fetch('https://thor.weidian.com/pyxis/pyxis.mysteryBoxApi/1.0', {
      method: 'POST',
      headers,
      body: step1Data
    })
    const step1Result = await step1Resp.json()

    if (!step1Result.result || !step1Result.result.apiUrl) {
      return jsonResponse(false, '无法获取API地址')
    }

    const apiUrl = step1Result.result.apiUrl

    // Step 2: Call the actual lottery API
    const step2Data = 'param=' + encodeURIComponent(JSON.stringify({
      auth: 'bad3126a',
      flowAction: 'mystery_box_main_page',
      showSold: true
    }))
    const step2Resp = await fetch(`https://thor.weidian.com/${apiUrl}`, {
      method: 'POST',
      headers,
      body: step2Data
    })
    const step2Result = await step2Resp.json()

    if (step2Result.result && typeof step2Result.result.sold === 'number') {
      return jsonResponse(true, null, step2Result.result.sold)
    }

    // Fallback: try GET method
    const getResp = await fetch(`https://thor.weidian.com/${apiUrl}?${step2Data}`, {
      headers: { ...headers, 'Content-Type': '' }
    })
    const getResult = await getResp.json()

    if (getResult.result && typeof getResult.result.sold === 'number') {
      return jsonResponse(true, null, getResult.result.sold)
    }

    return jsonResponse(false, step2Result.status?.message || '未找到抽数信息')
  } catch (error) {
    return jsonResponse(false, error.message)
  }
}

function jsonResponse(success, message, draws) {
  const body = success
    ? { success: true, draws, timestamp: Date.now() }
    : { success: false, message }
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'max-age=300'
    }
  })
}
