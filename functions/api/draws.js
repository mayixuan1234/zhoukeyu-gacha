export async function onRequestGet(context) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'https://www.91ruyu.com/gaia/85014/bad3126a.html',
    'Origin': 'https://www.91ruyu.com'
  }

  const maxRetries = 3
  const retryDelay = 1000

  async function fetchWithRetry(url, options, retries = maxRetries) {
    for (let i = 0; i < retries; i++) {
      try {
        const resp = await fetch(url, options)
        const data = await resp.json()
        if (data.status && data.status.code === 500 && i < retries - 1) {
          await new Promise(r => setTimeout(r, retryDelay * (i + 1)))
          continue
        }
        return data
      } catch (e) {
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, retryDelay * (i + 1)))
          continue
        }
        throw e
      }
    }
  }

  try {
    // Step 1: Get the API endpoint URL
    const step1Data = 'param=' + encodeURIComponent(JSON.stringify({ flow: 'mystery_box_main_page' }))
    const step1Result = await fetchWithRetry(
      'https://thor.weidian.com/pyxis/pyxis.mysteryBoxApi/1.0',
      { method: 'POST', headers, body: step1Data }
    )

    if (!step1Result || !step1Result.result || !step1Result.result.apiUrl) {
      return jsonResponse(false, step1Result?.status?.message || '无法获取API地址')
    }

    const apiUrl = step1Result.result.apiUrl

    // Step 2: Call the actual lottery API with retry
    const step2Params = {
      auth: 'bad3126a',
      flowAction: 'mystery_box_main_page',
      showSold: true
    }
    const step2Data = 'param=' + encodeURIComponent(JSON.stringify(step2Params))

    // Try POST first
    const step2Result = await fetchWithRetry(
      `https://thor.weidian.com/${apiUrl}`,
      { method: 'POST', headers, body: step2Data }
    )

    if (step2Result && step2Result.result && typeof step2Result.result.sold === 'number') {
      return jsonResponse(true, null, step2Result.result.sold)
    }

    // Fallback: try GET method
    try {
      const getResp = await fetch(`https://thor.weidian.com/${apiUrl}?${step2Data}`, {
        headers: { ...headers, 'Content-Type': '' }
      })
      const getResult = await getResp.json()

      if (getResult.result && typeof getResult.result.sold === 'number') {
        return jsonResponse(true, null, getResult.result.sold)
      }
    } catch (e) {
      // GET fallback failed, continue
    }

    // Try alternative: use page number in flow
    try {
      const altStep1Data = 'param=' + encodeURIComponent(JSON.stringify({ flow: '85014' }))
      const altStep1Result = await fetchWithRetry(
        'https://thor.weidian.com/pyxis/pyxis.mysteryBoxApi/1.0',
        { method: 'POST', headers, body: altStep1Data }
      )

      if (altStep1Result && altStep1Result.result && altStep1Result.result.apiUrl) {
        const altApiUrl = altStep1Result.result.apiUrl
        const altStep2Result = await fetchWithRetry(
          `https://thor.weidian.com/${altApiUrl}`,
          { method: 'POST', headers, body: step2Data }
        )

        if (altStep2Result && altStep2Result.result && typeof altStep2Result.result.sold === 'number') {
          return jsonResponse(true, null, altStep2Result.result.sold)
        }
      }
    } catch (e) {
      // Alternative approach failed
    }

    const errorMsg = step2Result?.status?.message || '未找到抽数信息'
    return jsonResponse(false, errorMsg)
  } catch (error) {
    return jsonResponse(false, error.message || '请求失败')
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
