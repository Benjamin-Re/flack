// set starting value for name
if (!localStorage.getItem('name'))
    localStorage.setItem('name', 'Stranger');

// wait for dom load, on form submit call function
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#name_form').onsubmit = change;

    // function loads input into localStorage
    function change () {
        var display_name = document.querySelector('#name').value;
        if (!display_name){
            //localStorage.setItem('name', 'empty');
            return true;
        }
            localStorage.setItem('name', display_name);
            return true;
    };

    // change placeholder to name in localStorage
    var name = localStorage.getItem('name');
    document.querySelector('#header').innerHTML = name;

});