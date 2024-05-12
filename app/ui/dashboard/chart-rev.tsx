import React from 'react'
import { lusitana } from '../fonts'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { generateYAxis } from '@/app/lib/utils';
import { Revenue } from '@/app/lib/definitions';

const ChartRev = ({revenue}: {revenue: Revenue[]}) => {
    const { yAxisLabels, topLabel } = generateYAxis(revenue);
    console.log(yAxisLabels)
  return (
    <div className='w-full md:col-span-4'>
        <h1 className={`${lusitana.className} sm:text-2xl  text-xl`}>Recent Revenue</h1>
        <div className='mt-4 rounded-md border p-4 bg-gray-50 '> 
          <div className='grid md:grid-cols-13 grid-cols-12 rounded-md gap-2 md:gap-4 items-end bg-white p-4'>
            <div className='mb-6 md:flex hidden flex-col h-[350px] justify-between  text-sm text-gray-400 '>
                {yAxisLabels.map((label) => (
                    <p key={label} className='text-xs text-gray-500'>{label}</p>
                ))}
            </div>

            {revenue.map((rev) => (
              <div key={rev.month} className='text-xs text-gray-500'>
                <div className={` bg-blue-300 rounded-md mb-3`} style={{
                  height: `${(350 / topLabel) * rev.revenue}px`,
                }}>
                </div>
                <p>{rev.month}</p>

              </div>
            ))}
          </div>
          <div className='flex pb-2 pt-6 items-end' >
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <h3 className="ml-2 text-sm text-gray-500 ">Last 12 months</h3>
          </div>

        </div>
    </div>
  )
}

export default ChartRev
