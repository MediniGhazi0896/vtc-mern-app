export const decodeToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = JSON.parse(atob(base64));
    return jsonPayload;
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
};
