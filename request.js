(async () => {
    const response = await fetch("https://api.prod.cloudmoonapp.com/phone/connect?device_type=web&query_uuid=8f1b60f1-2500-4a5e-9040-0f5cbe91001f&device_id=f4af5b98-8ff4-4e67-98ff-774ac964ca03", {
      headers: {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "x-user-language": "en",
        "x-user-locale": "US",
        "x-user-token": "eyJhbGciOiJIUzI1NiIsImtpZCI6InYyIiwidHlwIjoiSldUIn0.eyJpc3MiOiJORU5MWV9URUNITk9MT0dZIiwic3ViIjoie1wiZW1haWxcIjpcImNsYXNzY3JhZnQ4NkBnbWFpbC5jb21cIn0iLCJleHAiOjE3NjUxNjI3MjcsIm5iZiI6MTc2MjU3MDcyNywiaWF0IjoxNzYyNTcwNzI3LCJqdGkiOiI1NTcxODkzIn0.VDpYtbrV7iYENft-cNrLUohHehzHMdRlbrOJNoAxWYk"
      },
      referrer: "https://cloud.mo.google-analytics.worldplus-intl.org/",
      body: JSON.stringify({
        android_id: "1979193691322978304",
        game_name: "com.supercell.clashroyale",
        screen_res: "720x1280",
        server_id: 23,
        params: JSON.stringify({ language: "en", locale: "us" })
      }),
      method: "POST",
      mode: "cors",
      credentials: "omit"
    });
  
    const text = await response.text();
    console.log("Response body:", text);
  
    try {
      const json = JSON.parse(text);
      console.log("Parsed JSON:", json);
  
      // Extract required fields
      const coorUrl = encodeURIComponent(json.data.coordinator_host);
      const androidInstanceId = encodeURIComponent(json.data.android_instance_id);
      const userId = "1979193691322978304";
      const uuid = "0370920536";
      const token = "eyJhbGciOiJIUzI1NiIsImtpZCI6InYyIiwidHlwIjoiSldUIn0.eyJpc3MiOiJORU5MWV9URUNITk9MT0dZIiwic3ViIjoie1wiZW1haWxcIjpcImNsYXNzY3JhZnQ4NkBnbWFpbC5jb21cIn0iLCJleHAiOjE3NjUxNjI3MjcsIm5iZiI6MTc2MjU3MDcyNywiaWF0IjoxNzYyNTcwNzI3LCJqdGkiOiI1NTcxODkzIn0.VDpYtbrV7iYENft-cNrLUohHehzHMdRlbrOJNoAxWYk";
      const email = encodeURIComponent("classcraft86@gmail.com");
  
      // Construct the URL
      const constructedUrl = `https://cloud.mo.google-analytics.worldplus-intl.org/run-site/index.html?userid=${userId}&game=com.supercell.clashroyale&android_instance_id=${androidInstanceId}&coor_url=${coorUrl}&uuid=${uuid}&token=${token}&email=${email}`;
  
      console.log("Opening:", constructedUrl);
  
      // Open in a new tab
      window.open(constructedUrl, "_blank");
    } catch (e) {
      console.error("Failed to parse JSON or open URL:", e);
    }
  })();
  