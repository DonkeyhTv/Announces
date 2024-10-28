import * as React from 'react'
import { useState } from 'react'
import { TextField, Button } from '@mui/material'
import { TextareaAutosize } from '@mui/base'
import { styled } from '@mui/system'
import Textarea from '@mui/joy/Textarea'
import MyButton from './buttons'

const StyledTextarea = styled(TextareaAutosize)({
  resize: 'none',
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: '8px',
  width: '100%',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  '&:focus': {
    outline: 'none',
    borderColor: '#007bff',
  },
})

const StyledLabel = styled('label')(({ theme }) => ({
  position: 'absolute',
  lineHeight: 1,
  top: 'calc((var(--Textarea-minHeight) - 1em) / 2)',
  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
}))

const ContactForm: React.FC = () => {
  const [email, setEmail] = useState<string>('')
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const InnerTextarea = React.forwardRef<
    HTMLTextAreaElement,
    JSX.IntrinsicElements['textarea']
  >(function InnerTextarea(props, ref) {
    const id = React.useId()
    return (
      <React.Fragment>
        <StyledTextarea minRows={2} {...props} ref={ref} id={id} />
        <StyledLabel htmlFor={id}>Label</StyledLabel>
      </React.Fragment>
    )
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Form data submitted:', formData)
  }

  return (
    <form onSubmit={handleSubmit} className='max-w-7xl mx-auto space-y-4'>
      <div className='flex flex-wrap -mx-2'>
        <div className='w-full md:w-2/5 px-2'>
          <div className='mb-4'>
            <TextField
              label='Nom'
              className=' appearance-none border  py-2 px-3 text-anthracite0 leading-tight w-full bg-white rounded focus:outline-none focus:shadow-outline'
              id='name'
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className='mb-4'>
            <TextField
              label='Email'
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              className='w-full bg-white rounded'
              error={!!formErrors['email']}
              helperText={formErrors['email']}
            />
          </div>
        </div>

        <div className='w-full md:w-3/5 px-2'>
          <TextField
            className='w-full bg-white rounded'
            label='Message'
            multiline
            rows={4}
            value={formData.message}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className='flex justify-center'>
        <MyButton variant='anthracite' className='w-1/5 p-5 mb-5'>
          Envoyer
        </MyButton>
      </div>
    </form>
  )
}

export default ContactForm
