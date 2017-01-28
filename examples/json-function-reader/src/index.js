
import EquationParser from 'equation-parser';

import jsonPretty from 'json-pretty';

window.onload = main;

function main() {

  const $equationInput = document.getElementById('equation-input');

  $equationInput.addEventListener('input', ($element) => {
    const text = $element.target.value;

    if (text.trim().length === 0) {
      clearJSONContent();
      return;
    }

    let equationTree = null;
    try { equationTree = EquationParser.parse(text); }
    catch (error) { printError(error); }

    if (equationTree) {
      // Parsing was successful, no errors thrown.
      try { printTree(equationTree); }
      catch (error) { printError(error); }
    }

  });

}

function printError(error) {
  clearJSONContent();
  const $jsonContainer = document.getElementById('json-container');
  const $pre = document.createElement('pre');
  $pre.className = 'parse-error';
  $pre.appendChild(document.createTextNode(error.toString()));
  $jsonContainer.appendChild($pre);
  console.error(error);
}

function printTree(tree) {
  clearJSONContent();
  const $jsonContainer = document.getElementById('json-container');
  const $pre = document.createElement('pre');
  $pre.className = 'parse-tree';
  const $treeNode = document.createTextNode(jsonPretty(tree));
  $pre.appendChild($treeNode);
  $jsonContainer.appendChild($pre);
}

function clearJSONContent() {
  const $jsonContainer = document.getElementById('json-container');
  for (let $child of $jsonContainer.childNodes) {
    $jsonContainer.removeChild($child);
  }
}
