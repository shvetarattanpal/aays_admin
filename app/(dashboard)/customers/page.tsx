import { DataTable } from '@/components/custom-ui/DataTable'
import { columns } from '@/components/customers/CustomerColumns'
import { Separator } from '@/components/ui/separator'
import Customer from '@/lib/models/Customer'
import { connectToDB } from '@/lib/mongoDB'
import { serializeMongooseDocuments } from '@/lib/utils'

const Customers = async () => {
  await connectToDB()

  const customers = await Customer.find().sort({ createdAt: "desc" })
  const safeCustomers = serializeMongooseDocuments(customers)

  return (
    <div className='px-10 py-5'>
      <p className='text-heading2-bold'>Customers</p>
      <Separator className='bg-grey-1 my-5' />
      <DataTable columns={columns} data={safeCustomers} searchKey='name' />
    </div>
  )
}

export const dynamic = "force-dynamic"

export default Customers