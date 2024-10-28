import { FaTriangleExclamation } from 'react-icons/fa6'

interface FormErrorProps {
  message: string
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null

  return (
    <div className='bg-redlight p-3 rounded flex items-center gap-x-2 justify-center text-sm mt-0 text-anthracite'>
      <FaTriangleExclamation className='h-4 w-4 text-redpink' />
      <p>{message}</p>
    </div>
  )
}
