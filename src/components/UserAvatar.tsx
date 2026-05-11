interface UserAvatarProps {
  nome: string;
  avatarUrl?: string;
  className?: string;
}

export function UserAvatar({ nome, avatarUrl, className = 'w-full h-full object-cover' }: UserAvatarProps) {
  return (
    <img
      src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nome)}`}
      alt={nome}
      className={className}
    />
  );
}
