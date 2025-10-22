import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddBackofficeToUsers extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('backoffice').defaultTo(false).after('status')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('backoffice')
    })
  }
}
