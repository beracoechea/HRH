import { useState, useEffect, useCallback } from 'react'
import { AdminService } from '../../service/AdminService'
import { CreditService } from '../../service/CreditService'
import { AppointmentService } from '../../service/AppointmentService'
import { useFirestoreOperation } from './core/useFirestoreOperation'

const adminService = new AdminService()
const creditService = new CreditService()
const appointmentService = new AppointmentService()

export const useUserManager = (currentUser = null) => {
  const isHRH = currentUser?.grupo?.toUpperCase() === 'HRH';
  const userGroup = currentUser?.grupo;

  const [data, setData] = useState({
    users: [],
    pendingCitas: [],
    creditos: []
  })

  const { loading, execute } = useFirestoreOperation()


  const refreshData = useCallback(async () => {

    return execute(async () => {

      const queryGroup = isHRH ? null : userGroup;

      const [users, citas, creditos] = await Promise.all([
        adminService.getAllUsers(queryGroup).catch(() => []),
        appointmentService.getAllCitas(queryGroup).catch(() => []),
        creditService.getAll(queryGroup).catch(() => [])
      ])

      const filteredUsers = !isHRH && userGroup ? users.filter(u => u.grupo === userGroup) : users;
      const filteredCitas = !isHRH && userGroup ? citas.filter(c => c.grupo === userGroup) : citas;
      const filteredCreditos = !isHRH && userGroup ? creditos.filter(c => c.grupo === userGroup || c.usuario_grupo === userGroup) : creditos;

      setData({
        users: filteredUsers,
        pendingCitas: filteredCitas,
        creditos: filteredCreditos
      })

    })

  }, [execute, isHRH, userGroup])


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