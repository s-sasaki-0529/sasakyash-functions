import * as functions from 'firebase-functions'
import { fetchPaymentList } from '../zaim'
import * as dayjs from 'dayjs'
const cors = require('cors')({ origin: true })

type UtilityBills = {
  [date: string]: {
    electric?: number
    gas?: number
    water?: number
  }
}

export default functions.https.onRequest(async (request, response) => {
  const utilityBills: UtilityBills = {}
  const paymentList = await fetchPaymentList(dayjs('1980-01-01'), dayjs(), 105)
  paymentList.days().forEach(day => (utilityBills[day] = {}))
  paymentList.payments.forEach(payment => {
    if (payment.isWater) {
      utilityBills[payment.formattedDate].water = payment.amount
    } else if (payment.isGas) {
      utilityBills[payment.formattedDate].gas = payment.amount
    } else if (payment.isElectric) {
      utilityBills[payment.formattedDate].electric = payment.amount
    }
  })
  cors(request, response, () => {
    response.json({
      data: utilityBills
    })
  })
})
