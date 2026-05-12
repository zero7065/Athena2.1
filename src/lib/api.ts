export async function fetchApi(url: string, options: RequestInit = {}) {
  const res = await fetch(url, options);
  
  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error(`Non-JSON response from ${url}:`, text);
    throw new Error(`Server returned a non-JSON response (${res.status})`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  
  return data;
}
