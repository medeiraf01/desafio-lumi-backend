import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs('jwt', (): JwtModuleOptions => {
  const secret = process.env.JWT_SECRET;
  console.log('JWT Config - Secret definido:', !!secret);
  console.log('JWT Config - Secret valor (parcial):', secret ? secret.substring(0, 3) + '...' : 'não definido');
  
  return {
    secret: secret,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRATION || '1h',
    },
  };
});