"use server";
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {z} from 'zod';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';
import toast from 'react-hot-toast';

export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
      }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),  // Coercion means converting the value to the desired type if it's not already of that type. If the value cannot be coerced to a number, an error will be thrown during validation.
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
      }),
    date: z.string(),
  });

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
    const rawFormData = {
        customerId : formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    }
    // const rawFormData = Object.fromEntries(formData.entries())
    
    const validatedFields = CreateInvoice.safeParse(rawFormData);

    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Invoice.',
        };
      }

    const { customerId, amount, status } = validatedFields.data;

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];  // iso 8601: 2024-05-15T12:30:00.000Z


    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date} )
        `
        
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
          };
        
    }

   
    // Next.js has a Client-side Router Cache that stores the route segments in the user's browser for a time.
    // Along with prefetching, this cache ensures that users can quickly navigate between routes while reducing the number of requests made to the server.

    // Since you're updating the data displayed in the invoices route, 
    // you want to clear this cache and trigger a new request to the server. You can do this with the revalidatePath function from Next.js:
        
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}

const UpdateInvoice = FormSchema.omit({date: true });


export async function updateInvoice(id: string,formData: FormData) {
    const rawFormData = {
        id: id,
        customerId : formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    }
    // const rawFormData = Object.fromEntries(formData.entries())
    
    const {customerId, amount, status} = UpdateInvoice.parse(rawFormData);

    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
        
    } catch (error) {
        return {
            message: 'Database Error: Failed to Edit Invoice.',
          };
        
    }


    // Next.js has a Client-side Router Cache that stores the route segments in the user's browser for a time.
    // Along with prefetching, this cache ensures that users can quickly navigate between routes while reducing the number of requests made to the server.

    // Since you're updating the data displayed in the invoices route, 
    // you want to clear this cache and trigger a new request to the server. You can do this with the revalidatePath function from Next.js:
        
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}

export async function deleteInvoice(id: string) {

    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Invoice.',
          };
        
    }
   
  }

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
    console.log("Hey there");
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function  addUser( prevState: string | undefined,
    formData: FormData,){
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name')
        }
        const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6), name: z.string()})
            .safeParse(credentials);


        if(!parsedCredentials.success){
            return  'Error: Please type in valid Email and Password.'
        }
        const {email, password, name} = parsedCredentials.data;
        try {
            
            const hashedPassword = await bcrypt.hash(password, 10);

            const data =  await sql`SELECT COUNT(*) AS user_count
            FROM users
            WHERE email = ${email};
            `
            if(Number(data.rows[0].user_count)>0){
                return "Email Already Present"
            }
            const user = await sql`INSERT INTO users ( name, email, password)
            VALUES ( ${name}, ${email}, ${hashedPassword})
            ON CONFLICT (id) DO NOTHING;`
            
            
        } catch (error) {
            return "Error: Something went wrong."
            
        }
              
        // redirect('/login');
        return 'You have successfully created an account, Please proceed to login!'
        

    }




