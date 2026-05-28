type LogoRepubaseProps = {
  className?: string
}

export function LogoRepubase({ className = '' }: LogoRepubaseProps) {
  return (
    <img
      className={`logo-repubase ${className}`.trim()}
      src="/logo.svg"
      alt="Repubase"
      draggable="false"
    />
  )
}
