import Company from '#models/companie'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Company.create({
      companyName: 'ORA - ADVICES',
      address: 'Calavi-ZOCA',
      phoneNumber: '229xxxxxxxx',
      status: true,
    })
  }
}
