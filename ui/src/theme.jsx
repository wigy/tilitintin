import { createTheme } from '@material-ui/core'
import { green, orange } from '@material-ui/core/colors'

const theme = createTheme({
  palette: {
    primary: {
      main: green[900],
    },
    secondary: {
      main: orange[800],
    },
  },
})

export default theme
