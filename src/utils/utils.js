export function getApiUrls() {
  const herokuHostnames = ["t20-social-distribution.herokuapp.com", "www.t20-social-distribution.herokuapp.com"];

  if (herokuHostnames.includes(window.location.hostname)) {
    const herokuUrl = `https://${window.location.hostname}/`;
    console.log("Using Heroku URL: ", herokuUrl);
    return `${herokuUrl}`;
  } else {
    const localHost = window.location.hostname;
    const localPort = window.location.port || '8000'; // use the port from the URL if available, or default to 8000      
    console.log('Using local URL: ', `http://${localHost}:${localPort}`);
    return `http://${localHost}:${localPort}`;
  }
}
