let sheet
let ruleIndex = -1 // Variable to store the index of the added rule

function addCSSRule(sheet, selector, rules, index) {
  if (sheet.insertRule) {
    sheet.insertRule(selector + "{" + rules + "}", index)
    return index // Return the index of the added rule
  } else if (sheet.addRule) {
    sheet.addRule(selector, rules, index)
    return index // Return the index of the added rule
  }
  return -1 // Return -1 if the rule was not added
}

// Function to remove CSS rule
function removeCSSRule(sheet, index) {
  if (index !== -1 && sheet.cssRules[index]) {
    sheet.deleteRule(index)
  }
}

// Function to remove CSS rule by selector
function removeCSSRuleBySelector(sheet, selector) {
  for (let i = 0; i < sheet.cssRules.length; i++) {
    if (sheet.cssRules[i].selectorText === selector) {
      sheet.deleteRule(i)
      // console.log(`Removed rule for selector: ${selector}`)
      break
    }
  }
}

// Function to remove all CSS rules
function removeAllCSSRules(sheet) {
  for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
    sheet.deleteRule(i)
  }
  // console.log("Removed all CSS rules.")
}
