import bcrypt from 'bcrypt'

const SALT = 10

export const hash = async (value: string) => {
   const hash = await bcrypt.hash(value, SALT)
   return hash
}

export const compare = async (password: string, hash: string) => {
   const isValid = await bcrypt.compare(password, hash)
   console.log('isValid', isValid)
   return isValid
}
