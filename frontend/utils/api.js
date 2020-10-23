function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export function post(url, data){
  console.log(`post(${url}, ${JSON.stringify(data)}`);
  const csrftoken = getCookie('csrftoken');
  const request = new Request(
    url,
    { headers: {'X-CSRFToken': csrftoken, 'Content-Type': 'application/json'} }
  );
  return fetch(request, {
    method: 'POST',
    mode: 'same-origin',
    body: JSON.stringify(data)
  }).then(response => response.json());
};
