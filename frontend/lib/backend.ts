import client from '~backend/client';

const backend = client.with({
  auth: () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return undefined;
    }
    return {
      authorization: `Bearer ${token}`
    };
  }
});

export default backend;
