'use strict';

(function () {
  $(document).ready(function () {
    const table = $('#parameterTable');
    const tableBody = table.children('tbody');

    // This is the entry point into the extension.  It initializes the Tableau Extensions Api, and then
    // grabs all of the parameters in the workbook, processing each one individually.
    tableau.extensions.initializeAsync().then(function () {
      tableau.extensions.worksheetContent.worksheet.getParametersAsync().then(function (parameters) {
        parameters.forEach(function (p) {
          p.addEventListener(tableau.TableauEventType.ParameterChanged, onParameterChange);
          parameterRow(p).appendTo(tableBody);
        });

        // This is used to manipulate what part of the UI is visible.  If there are no parameters
        // found, we want to give you a message to tell you that you need to add one, otherwise, we
        // show the table we created.
        $('#loading').addClass('hidden');
        if (parameters.length === 0) {
          $('#addParameterWarning').removeClass('hidden').addClass('show');
        } else {
          $('#parameterTable').removeClass('hidden').addClass('show');
        }
      });
    });
  });

  // When the parameter is changed, we recreate the row with the updated values.  This keeps the code
  // clean, and emulates the approach that something like React does where it "rerenders" the UI with
  // the updated data.
  //
  // To avoid multiple layout processing in the browser, we build the new row unattached to the DOM,
  // and then attach it at the very end.  This helps avoid jank.
  function onParameterChange (parameterChangeEvent) {
    parameterChangeEvent.getParameterAsync().then(function (param) {
      const newRow = parameterRow(param);
      const oldRow = $("tr[data-fieldname='" + param.id + "'");
      oldRow.replaceWith(newRow);


      // Send the updated parameter value to the backend
      const value = param.currentValue.formattedValue;

      // Update the backend server with the current value
      $.ajax({
        url: 'https://sc-params.gdit.deltaverse-intl.com:5001/updateParameterValue',  // Corrected to the update endpoint
        method: 'POST',
        data: JSON.stringify({ 'key' : param.name , 'value' : value}),  // Send the value in the request body
        contentType: 'application/json',
        success: function (response) {
          console.log('Parameter value updated:', response);
        },
        error: function (err) {
          console.error('Failed to update parameter value:', err);
        }
      });

      
    });
  }

  //
  // DOM creation methods
  //

  // A cell in the table
  function cell (value) {
    const row = $('<td>');
    row.append(value);
    return row;
  }

  // A simple cell that contains a text value
  function textCell (value) {
    const cellElement = $('<td>');
    cellElement.text(value);
    return cellElement;
  }


  // This function creates a subtree of a row for a specific parameter.
  function parameterRow (p) {
    const row = $('<tr>').attr('data-fieldname', p.id);
    row.append(textCell(p.name));
    row.append(textCell(p.dataType));
    row.append(textCell(p.currentValue.formattedValue));
    // row.append(cell(allowableValues(p.allowableValues)));

    return row;
  }
})();
