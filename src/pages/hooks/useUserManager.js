import { useState, useEffect, useCallback } from 'react'
import { AdminService } from '../../service/AdminService'
import { CreditService } from '../../service/CreditService'
import { AppointmentService } from '../../service/AppointmentService'
import { useFirestoreOperation } from './core/useFirestoreOperation'

const adminService = new AdminService()
const creditService = new CreditService()
const appointmentService = new AppointmentService()

export const useUserManager = () => {

  const [data, setData] = useState({
    users: [],
    pendingCitas: [],
    creditos: []
  })

  const { loading, execute } = useFirestoreOperation()


  const refreshData = useCallback(async () => {

    return execute(async () => {

      const [users, citas, creditos] = await Promise.all([

        adminService.getAllUsers().catch(() => []),
        appointmentService.getAllCitas().catch(() => []),
        creditService.getAll().catch(() => [])

      ])

      setData({
        users,
        pendingCitas: citas,
        creditos
      })

    })

  }, [execute])


  const updateCreditStatus = useCallback(async (payload) => {
    const { creditoId } = payload;
    
    if (!creditoId) {
      throw new Error("ID de crédito no proporcionado");
    }

    return execute(async () => {
      // Enviamos el objeto completo al servicio
      await creditService.updateStatus(creditoId, payload);
      await refreshData();
    })
  }, [execute, refreshData])

  useEffect(() => {
    refreshData()
  }, [refreshData])
  return {

    users: data.users,
    pendingCitas: data.pendingCitas,
    creditos: data.creditos,
    loading,
    refreshData,
    updateCreditStatus,
    

  }

}