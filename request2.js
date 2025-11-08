fetch("https://api.prod.cloudmoonapp.com/phone/list?device_type=web&query_uuid=d83c02d3-6019-4739-9195-c2c220a0e737&device_id=f4af5b98-8ff4-4e67-98ff-774ac964ca03", {
    "headers": {
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
      "x-user-token": "eyJhbGciOiJIUzI1NiIsImtpZCI6InYyIiwidHlwIjoiSldUIn0.eyJpc3MiOiJORU5MWV9URUNITk9MT0dZIiwic3ViIjoie1wiZW1haWxcIjpcImNsYXNzY3JhZnQ4NkBnbWFpbC5jb21cIn0iLCJleHAiOjE3NjUxNjI3MjcsIm5iZiI6MTc2MjU3MDcyNywiaWF0IjoxNzYyNTcwNzI3LCJqdGkiOiI1NTcxODkzIn0.VDpYtbrV7iYENft-cNrLUohHehzHMdRlbrOJNoAxWYk",
      "Referer": "https://cloud.mo.google-analytics.worldplus-intl.org/"
    },
    "body": null,
    "method": "GET"
  })
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response.text();
  })
  .then(data => {
    console.log('Response body:', data);
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON:', jsonData);
    } catch (e) {
      console.log('Response is not valid JSON');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });