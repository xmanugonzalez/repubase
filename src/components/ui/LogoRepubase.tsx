type LogoRepubaseProps = {
  className?: string
}

const logoSrc = `${import.meta.env.BASE_URL}logo.svg`

export function LogoRepubase({ className = '' }: LogoRepubaseProps) {
  return (
    <img
      className={`logo-repubase ${className}`.trim()}
      src={logoSrc}
      alt="Repubase"
      draggable="false"
    />
  )
}
