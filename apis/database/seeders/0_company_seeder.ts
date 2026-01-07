import Companie from '#models/companie'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class CompanieSeeder extends BaseSeeder {
  public async run() {
    await Companie.createMany([
      // {
      //   companyName: 'Innovatech Solutions',
      //   status: true,
      //   showCompanyName: true,
      //   address: '123 Tech Park, Silicon Valley, CA 94000',
      //   phoneNumber: '+1-800-555-0101',
      //   logoUrl: 'logo/company-logo.png',
      // },
      {
        companyName: 'ORA ADVICES',
        status: true,
        showCompanyName: true,
        address: 'ABOMEY CALAVI',
        phoneNumber: '+1-800-555-0102',
        logoUrl: 'logo/company-logo.png',
      },
    ])
  }
}
