const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^\+?[1-9]\d{1,14}$/

const SALT=10
export{
    emailRegex,
    phoneRegex,
    SALT
}