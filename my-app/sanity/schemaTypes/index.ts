import { type SchemaTypeDefinition } from 'sanity'

import {workType} from './workType'
import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [workType, blockContentType, categoryType, postType, authorType],
}
