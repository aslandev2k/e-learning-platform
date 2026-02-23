import { AUTH_TOKEN_NAME } from '@repo/shared/src/utils/constants';
import Cookies from 'js-cookie';

const AuthCookie = Cookies.withAttributes({
  secure: import.meta.env.PROD,
  sameSite: 'Strict',
});

const getAuthToken = () => AuthCookie.get(AUTH_TOKEN_NAME) || '';
const saveAuthToken = (token: string) => {
  AuthCookie.set(AUTH_TOKEN_NAME, token);
};
const clearCookie = () => {
  AuthCookie.remove(AUTH_TOKEN_NAME);
};

const clientCookie = {
  saveAuthToken,
  getAuthToken,
  clear: clearCookie,
};

export default clientCookie;
