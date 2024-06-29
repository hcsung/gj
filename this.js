const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'W/E'];
const HOUR = ['09', '10', '11', '13', '14', '15', '16', '17', '+']

function hourly(target) {
    let tb = document.createElement('table');
    let tr = document.createElement('tr');
    let td = document.createElement('td');

    tb.classList.add('hourly');

    // week days
    tr.classList.add('header');
    for (let i = 0; i < DAYS.length; i++) {
        td = document.createElement('td');
        if (i < DAYS.length - 1)
            td.style.columnSpan = HOUR.length;
        td.textContent = DAYS[i];
        tr.appendChild(td);
    }
    tb.appendChild(tr);

    // hours
    tr = document.createElement('tr').classList.add('header');
    for (let i = 0; i < DAYS.length; i++) {
        for (let j = 0; j < HOUR.length; j++) {
            td = document.createElement('td');
            td.classList.add('d' + i);
            td.classList.add('h' + j);
            if (i < DAYS.length - 1)
                td.textContent(HOUR[j]);
            else
                td.textContent('+');
            tr.appendChild(td);
            if (i == DAYS.length - 1)
                break;
        }
    }
    td = document.createElement('td');
    td.textContent = HOUR[j];
    tb.appendChild(tr);

    target.appendChild(tb);
}

function input(key) {
    const raw = localStorage.getItem('db');
    let obj = document.createElement('input');

    if (raw == null) {
        console.log('error: db not found');
        return;
    }

    const db = JSON.parse(raw)['db'];

    if (db[key] == null) {
        let len = 16;
        if (key.toLowerCase() == 'year') {
            const date = new Date();
            obj.setAttribute('value', date.getFullYear());
            len = 4;
        } else if (key.toLowerCase() == 'note' ||
            key.toLowerCase() == 'title') {
            len = -1;
        }
        if (len > 0) {
            obj.setAttribute('maxlength', len);
            obj.setAttribute('size', len);
        }
    } else {
        let list = db[key];

        obj = document.createElement('select');

        if (key.toLowerCase() == 'client' ||
            key.toLowerCase() == 'platform' ||
            key.toLowerCase() == 'project') {
            list = [];
            db[key].forEach(record => {
                list.push(record['Name']);
            });
        }
        list.forEach(i => {
            let opt = document.createElement('option');
            opt.setAttribute('value', i);
            opt.textContent = i;
            obj.appendChild(opt);
        });
    }
    return obj;
}

function swap_icon(target) {
    if (target.classList.contains('swap'))
        target.classList.remove('swap');
    else
        target.classList.add('swap');
}

function modifiable_table(data) {
    let keys = Object.keys(data[0]);
    let tb = document.createElement('table');
    let tr = document.createElement('tr');
    let td = document.createElement('td');

    tb.classList.add('modifiable');

    // lock
    tr.appendChild(document.createElement('th')
        .appendChild(button('lock', function (e) {
            console.log();
            let tr = e.target.parentNode;
            let tb = tr.parentNode;
            if (tb.classList.contains('locked'))
                tb.classList.remove('locked');
            else
                tb.classList.add('locked');
            swap_icon(e.target);
        }))
    );

    // headers
    keys.forEach(key => {
        let th = document.createElement('th');
        th.textContent = key;
        tr.appendChild(th);
        tb.appendChild(tr);
    });

    // add a new record
    tr = document.createElement('tr');
    tr.classList.add('control');
    td.appendChild(button('add'));
    tr.appendChild(td);
    keys.forEach(key => {
        td = document.createElement('td');
        td.appendChild(input(key));
        tr.appendChild(td);
    });
    tb.appendChild(tr);

    data.forEach(obj => {
        tr = document.createElement('tr');
        td = document.createElement('td');
        td.classList.add('control');
        td.appendChild(button('delete'));
        tr.appendChild(td);
        keys.forEach(key => {
            td = document.createElement('td');
            td.textContent = obj[key];
            tr.appendChild(td);
        });
        tb.appendChild(tr);
    });

    tb.classList.add('locked');
    return tb;
}

function button(name, action = undefined) {
    let obj = document.createElement('div');

    obj.classList.add('icon');
    obj.classList.add('button');
    obj.classList.add(name);
    obj.addEventListener('click', action);
    return obj;
}

function platforms(target, db) {
    let h2 = document.createElement('h2');

    h2.textContent = 'Platform';
    target.appendChild(h2);
    target.appendChild(modifiable_table(db['Platform']));
}

function projects(target, db) {
    let h2 = document.createElement('h2');

    h2.textContent = 'Projects';
    target.appendChild(h2);
    target.appendChild(modifiable_table(db['Project']));
}

function issues(target, db) {
    let h2 = document.createElement('h2');

    h2.textContent = 'Issues';
    target.appendChild(h2);

    fetch('issues.json').then(response => response.json())
        .then(json => {
            target.appendChild(modifiable_table(json['Issues']));
        });
}

function bright() {
    return localStorage.getItem('bright') ? true : false;
}

window.onload = function () {
    let menu = document.getElementById('banner')
        .getElementsByClassName('menu')[0];

    let light_switch = button('light', function (e) {
        if (bright())
            localStorage.removeItem('bright');
        else
            localStorage.setItem('bright', '1');
        swap_icon(document.documentElement);
        swap_icon(e.target);
    });

    if (bright()) {
        swap_icon(document.documentElement);
        swap_icon(light_switch);
    }

    menu.appendChild(button('upload'));
    menu.appendChild(button('download'));
    menu.appendChild(light_switch);

    fetch('db.json').then(response => response.json())
        .then(json => {
            localStorage.setItem('db', JSON.stringify(json));
            const db = json['db'];
            const target = document.getElementById('content')
            platforms(target, db);
            projects(target, db);
            issues(target, db);
        });

    new FloatingBlocks(document.getElementsByClassName('floating-blocks')[0]);

    // delay for js to render the page
    setTimeout(() => { document.body.style.opacity = 1; }, 200);
};
