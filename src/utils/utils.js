export function getApiUrls() {
  const herokuHostnames = ["t20-social-distribution.herokuapp.com", "www.t20-social-distribution.herokuapp.com"];

  if (herokuHostnames.includes(window.location.hostname)) {
    const herokuUrl = `https://${window.location.hostname}/`;
    return `${herokuUrl}`;
  } else {
    const localHost = window.location.hostname;
    const localPort = window.location.port || '8000'; // use the port from the URL if available, or default to 8000  
    if (localPort === '3000') {
      return `https://t20-social-distribution.herokuapp.com`;
    }
    return `http://${localHost}:${localPort}`;
  }
}
