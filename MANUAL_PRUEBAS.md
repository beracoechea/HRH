# Manual de Pruebas y Validación (QA) - Plataforma CrediGO

Este documento servirá para validar la integridad del sistema tras las implementaciones actuales (Fase 1 y 2) y como base para recibir las Fases 3, 4 y 5.

## 1. Pruebas de Identidad (KYC e IA)
| ID | Acción | Resultado Esperado |
| :--- | :--- | :--- |
| 1.1 | Subir documentos legibles (INE/RFC) como Usuario. | El modal de Gemini debe aparecer en pantalla completa (Portal) sin cortarse. |
| 1.2 | Finalizar carga de documentos. | El backend debe procesar mediante la API `v1`. Los campos de nombre, CURP y RFC deben pre-llenarse. |
| 1.3 | Subir documentos borrosos o incorrectos. | El sistema debe marcar `esOCRConfiable: false` y notificar al Admin. |

## 2. Pruebas de Roles y Seguridad
| ID | Acción | Resultado Esperado |
| :--- | :--- | :--- |
| 2.1 | Loguearse como rol `rh` asociado al Grupo "Empresa A". | Solo debe ver usuarios y créditos de "Empresa A". No de "Empresa B". |
| 2.2 | Intentar acceder por URL al ID de un crédito de otro grupo. | Debe mostrar un error de "Sin permisos" y denegar la carga de datos. |
| 2.3 | Loguearse como `analista`. | Debe ver la "Consola de Cumplimiento" y el Semáforo de Riesgo en el expediente. |

## 3. Pruebas de Evaluación (Admin)
| ID | Acción | Resultado Esperado |
| :--- | :--- | :--- |
| 3.1 | Abrir un expediente en revisión. | El Semáforo de Riesgo debe mostrar Verde, Amarillo o Rojo según el score. |
| 3.2 | Aprobar Fase 1 (KYC). | El crédito debe cambiar a `fase: 2` y actualizar las métricas de tiempo. |

## 4. Pruebas de Formalización (Fase 3 - Próximamente)
| ID | Acción | Resultado Esperado |
| :--- | :--- | :--- |
| 4.1 | Generar contrato desde vista Admin. | Se debe crear un PDF en Mifiel y enviar correo al cliente. |
| 4.2 | Abrir link de Mifiel como Cliente. | El documento debe mostrar los datos correctos extraídos en la Fase 1. |

## 5. Checklist de Despliegue Crítico
- [ ] ¿Se ejecutó `cd functions && npm run deploy` tras el parche `v1`?
- [ ] ¿Está habilitada la "Generative Language API" en Google Cloud Console?
- [ ] ¿El API Key de Mifiel en `mifielService.js` es la correcta para Sandbox?

---
> [!IMPORTANT]
> **Reporting**: Cualquier error 500 debe ser reportado con el log de Firebase Functions (`firebase functions:log`) para identificar el origen de la falla.
