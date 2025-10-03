import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'companies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('company_name').nullable()
      table.string('phone_number').nullable()
      table.string('address').nullable()
      table.string('logo_url').nullable()
      table.string('avatar').nullable()
      table.boolean('status').defaultTo(false)
      table.boolean('show_company_name').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
