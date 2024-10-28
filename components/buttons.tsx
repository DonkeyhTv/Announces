import React from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

type MyButtonVariant =
  | 'redpink-anthracite'
  | 'anthracite-redpink'
  | 'anthracite'
  | 'lightgray-redpink'
  | 'lightgray'
  | 'redpink'
  | 'default'
  | 'close-modal'

interface MyButtonProps {
  variant?: MyButtonVariant
  className?: string
  children?: React.ReactNode
  [key: string]: any
  to?: string
}

const getClasses = (variant: MyButtonVariant) => {
  switch (variant) {
    case 'redpink-anthracite':
      return 'bg-redpink text-white hover:bg-anthracite hover:text-white px-4 py-2 inline-block rounded-md mt-4'
    case 'anthracite-redpink':
      return 'bg-anthracite text-white rounded-md hover:bg-redpink px-4 py-2 hover:text-white'
    case 'anthracite':
      return 'bg-anthracite text-white hover:bg-anthracite px-4 py-2 hover:text-redpink rounded-md hover:text-white'
    case 'lightgray-redpink':
      return 'bg-lightgray text-anthracite hover:bg-redpink hover:text-white'
    case 'lightgray':
      return 'bg-lightgray text-anthracite hover:bg-lightgray hover:text-anthracite px-4 py-2 '
    case 'redpink':
      return 'bg-redpink text-white opacity-50 hover:text-white px-4 py-2 inline-block rounded-md mt-4'
    case 'close-modal':
      return 'bg-redpink text-white absolute -right-3 -top-3 shadow-md border-2 border-white p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-anthracite hover:text-white'
    default:
      return 'bg-lightgray text-anthracite hover:bg-redpink hover:text-white'
  }
}

const MyButton: React.FC<MyButtonProps> = ({
  variant = 'default',
  children,
  className,
  to,
  ...props
}) => {
  const buttonClasses = clsx(
    getClasses(variant),
    'transition-all duration-300',
    className,
  )

  if (to) {
    return (
      <Link to={to} className={buttonClasses} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  )
}

export default MyButton
