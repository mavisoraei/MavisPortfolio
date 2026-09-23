import {CaseIcon} from '@sanity/icons/Case'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const workType = defineType({
  name: 'work',
  title: 'Work',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'indexNumber',
      title: 'Index Number',
      description: 'Row number shown in the accordion, zero-padded (e.g. "11", "12").',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Accordion row title (e.g. "Personal Work", "Velma").',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'previewImages',
      title: 'Preview Images',
      description: 'Up to 3 thumbnails shown in the accordion row’s hover preview.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    defineField({
      name: 'fullGallery',
      title: 'Full Gallery',
      description: 'Full gallery opened as a lightbox when the row is expanded.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      indexNumber: 'indexNumber',
      title: 'title',
      media: 'previewImages.0',
    },
    prepare(selection) {
      const {indexNumber, title} = selection
      return {
        title: title || 'Untitled work',
        subtitle: indexNumber ? `#${indexNumber}` : '',
      }
    },
  },
})