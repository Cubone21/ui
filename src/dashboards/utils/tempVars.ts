import {getDeep} from 'src/utils/wrappers'
import qs from 'qs'

import {formatTempVar} from 'src/tempVars/utils'

import {Template, TemplateQuery} from 'src/types'
import {TemplateQPSelections} from 'src/types/dashboards'

export const makeQueryForTemplate = ({
  influxql,
  db,
  measurement,
  tagKey,
}: TemplateQuery): string =>
  influxql
    .replace(':database:', `"${db}"`)
    .replace(':measurement:', `"${measurement}"`)
    .replace(':tagKey:', `"${tagKey}"`)

export const templateSelectionsFromQueryParams = (): TemplateQPSelections => {
  const queryParams = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  })
  const tempVars = queryParams.tempVars || {}

  return Object.entries(tempVars).reduce(
    (acc, [tempVar, v]) => ({...acc, [formatTempVar(tempVar)]: v}),
    {}
  )
}

export const queryParamsFromTemplates = (templates: Template[]) => {
  return templates.reduce((acc, template) => {
    const tempVar = stripTempVar(template.tempVar)
    const selection = template.values.find(t => t.localSelected)

    if (!selection) {
      return acc
    }

    return {
      ...acc,
      [tempVar]: selection.value,
    }
  }, {})
}

export const applySelections = (
  templates: Template[],
  selections: TemplateQPSelections
): void => {
  for (const {tempVar, values} of templates) {
    if (!values.length) {
      continue
    }

    let selection = selections[tempVar]

    if (!selection || !values.find(v => v.value === selection)) {
      selection = values.find(v => v.selected).value
    }

    for (const value of values) {
      value.localSelected = value.value === selection
    }
  }
}

export const stripTempVar = (tempVarName: string): string =>
  tempVarName.substr(1, tempVarName.length - 2)

const makeSelected = (template: Template, value: string): Template => {
  const found = template.values.find(v => v.value === value)

  let valueToChoose
  if (found) {
    valueToChoose = found.value
  } else {
    valueToChoose = getDeep<string>(template, 'values.0.value', '')
  }

  const valuesWithSelected = template.values.map(v => {
    if (v.value === valueToChoose) {
      return {...v, selected: true}
    } else {
      return {...v, selected: false}
    }
  })

  return {...template, values: valuesWithSelected}
}

export const pickSelected = (template: Template): Template => {
  const selectedValue = ''

  return makeLocalSelected(template, selectedValue)
}

export const makeLocalSelected = (
  template: Template,
  value: string
): Template => {
  const found = template.values.find(v => v.value === value)
  const selectedValue = template.values.find(v => v.selected)

  let valueToChoose: string
  if (found) {
    valueToChoose = found.value
  } else if (selectedValue) {
    valueToChoose = selectedValue.value
  } else {
    valueToChoose = getDeep<string>(template, 'values.0.value', '')
  }

  const valuesWithLocalSelected = template.values.map(v => {
    if (v.value === valueToChoose) {
      return {...v, localSelected: true}
    } else {
      return {...v, localSelected: false}
    }
  })

  return {...template, values: valuesWithLocalSelected}
}

export const reconcileSelectedAndLocalSelectedValues = (
  nextTemplate: Template,
  nextNextTemplate: Template
): Template => {
  const localSelectedValue = nextTemplate.values.find(v => v.localSelected)
  const selectedValue = nextTemplate.values.find(v => v.selected)
  const templateWithLocalSelected = makeSelected(
    nextNextTemplate,
    getDeep<string>(selectedValue, 'value', '')
  )

  const templateWithLocalSelectedAndSelected = makeLocalSelected(
    templateWithLocalSelected,
    getDeep<string>(localSelectedValue, 'value', '')
  )

  return templateWithLocalSelectedAndSelected
}
