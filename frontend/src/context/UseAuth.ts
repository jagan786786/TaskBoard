import { useContext } from 'react';
import { AuthContext } from './auth-context';

export const useAuth = () => {
  const context = useContext(AuthContext);
  //fhgfjgytdyftydhgjkl;jhgfdsdrftgyjhukjl
  //erdtfyguijkopokiuytfdrertfyguhij
  console.log(context);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
