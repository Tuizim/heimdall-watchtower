import { LoginDecorator } from '../components/login/LoginDecorator';
import { LoginForm } from '../components/login/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-viking-deep overflow-hidden">
      <LoginDecorator />
      <LoginForm />
    </div>
  );
}
