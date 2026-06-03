import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando corrección de base de datos...");

  // 1. Marcar a los empleados que tuvieron bajas en abril de 2026 como inactivos
  const targetBajas = [
    { payrollType: "QNA", payrollCode: "02", name: "Carlos Miguel Cabriales Villasana" },
    { payrollType: "QNA", payrollCode: "04", name: "Julio Cesar Vazquez Cano" },
    { payrollType: "QNA", payrollCode: "09", name: "Irma Flores Perez" }
  ];

  for (const target of targetBajas) {
    const employee = await prisma.employee.findUnique({
      where: {
        payrollType_payrollCode: {
          payrollType: target.payrollType,
          payrollCode: target.payrollCode
        }
      }
    });

    if (employee) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { isActive: false }
      });
      console.log(`✅ Empleado ${target.name} (${target.payrollType}-${target.payrollCode}) marcado como INACTIVO.`);
    } else {
      console.log(`⚠️ No se encontró al empleado ${target.name} (${target.payrollType}-${target.payrollCode}) en la base de datos.`);
    }
  }

  // 2. Limpiar registros inválidos creados a partir de la fila de encabezado del Excel
  const invalidHeaderEmp = await prisma.employee.findUnique({
    where: {
      payrollType_payrollCode: {
        payrollType: "ID Nomina",
        payrollCode: "Clave de Participante"
      }
    }
  });

  if (invalidHeaderEmp) {
    console.log("🧹 Encontrado registro inválido de cabecera. Eliminando...");
    
    // Eliminar registros mensuales asociados
    await prisma.employeeMonthlyRecord.deleteMany({
      where: { employeeId: invalidHeaderEmp.id }
    });

    // Eliminar el usuario asociado si existe
    if (invalidHeaderEmp.userId) {
      await prisma.user.delete({
        where: { id: invalidHeaderEmp.userId }
      });
      console.log(`🗑️ Usuario asociado ${invalidHeaderEmp.userId} eliminado.`);
    }

    // Eliminar el empleado
    await prisma.employee.delete({
      where: { id: invalidHeaderEmp.id }
    });
    console.log("🗑️ Registro de empleado inválido eliminado.");
  } else {
    console.log("ℹ️ No se encontró ningún registro de cabecera inválido para eliminar.");
  }

  console.log("🎉 Corrección finalizada exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error durante la corrección:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
