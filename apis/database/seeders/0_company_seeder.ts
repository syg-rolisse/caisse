import Companie from '#models/companie'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class CompanieSeeder extends BaseSeeder {
  public async run() {
    await Companie.createMany([
      {
        companyName: 'Innovatech Solutions',
        status: true,
        showCompanyName: true,
        address: '123 Tech Park, Silicon Valley, CA 94000',
        phoneNumber: '+1-800-555-0101',
        logoUrl: 'logo/company-logo.png',
      },
      {
        companyName: 'Creative Buzz Agency',
        status: true,
        showCompanyName: true,
        address: '456 Marketing Ave, New York, NY 10001',
        phoneNumber: '+1-800-555-0102',
        logoUrl: 'logo/company-logo.png',
      },
      {
        companyName: 'EcoBuild Constructions',
        status: true,
        showCompanyName: true,
        address: '789 Green Way, Austin, TX 78701',
        phoneNumber: '+1-800-555-0103',
        logoUrl: 'logo/company-logo.png',
      },
      {
        companyName: 'Gourmet Foods Inc.',
        status: true,
        showCompanyName: true,
        address: '101 Culinary Rd, Chicago, IL 60601',
        phoneNumber: '+1-800-555-0104',
        logoUrl: 'logo/company-logo.png',
      },
    ])
  }
}
