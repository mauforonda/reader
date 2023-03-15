const nav = document.querySelector('.nav');
const feed = document.querySelector('.feed');

var relativeDate = new Intl.RelativeTimeFormat('en', { style: 'narrow', numeric: 'auto'});
const now = Date.now();

let data;
let activeFeed;
let openPost;

newElement = (element, classList) => {

    const el = document.createElement(element)
    el.classList.add(...classList)
    return el

}

navUpdate = (category) => {

    const active = document.querySelector('.active')
    if (active) {
        active.classList.remove('active')
    }
    document.querySelector(`[data-category="${category}"]`).classList.add('active')

}

categoryHandler = (e) => {

    var category  = e.target.dataset.category
    if (activeFeed != category) {
        navUpdate(category)
        const renderedCategory = document.querySelector('.category')
        if (renderedCategory) {
            renderedCategory.remove()
        }
        render_category(data[category])
    }

}

renderPost = (el, postID) => {

    const post = document.createElement('div')
    post.classList.add('post')
    fetch(`posts/${postID}`).then((response) => {
        response.text().then((postText) => {
            post.innerHTML = postText
        })
    })
    post.addEventListener('click', (e) => {
        e.stopPropagation()
    })
    el.closest('.content').appendChild(post)
    entry = el.closest('.entry')
    entry.classList.add('open')
    feed.classList.add('reading')
    entry.scrollIntoView({block:'nearest', behavior: "auto"})
    openPost = postID

}

linkHandler = (e) => {

    e.stopPropagation()
    var postID  = e.target.closest('.content').dataset.post
    if (openPost == postID) {
        feed.classList.remove('reading')
        const reading = document.querySelector('.post')
        if (reading) {
            reading.closest('.entry').classList.remove('open')
            reading.remove()
        }
        const el = e.target.closest('.entry')
        elTop = el.getBoundingClientRect().top + window.pageYOffset
        if (window.scrollY > elTop) {
            window.scrollTo({top: elTop - 30, behavior: 'auto'})
        }
        openPost = ''
    } else {
        const reading = document.querySelector('.post')
        if (reading) {
            reading.closest('.entry').classList.remove('open')
            reading.remove()
        }
        renderPost(e.target, postID)
    }

}

formatEntry = (entry) => {

    date = new Date(entry['published_at'])
    days = parseInt((now - date) / 86400000)
    dateShort = relativeDate.format(0 - days, 'day')
    dateLong = date.toLocaleDateString('en-US', {hour:"numeric", minute:"numeric", day: "numeric", month: 'long', hourCycle: 'h23'})

    const link = newElement('a', ['entry'])
    
    const content = newElement('div', ['content'])
    content.dataset.post = entry.id
    content.addEventListener('click', linkHandler)

    const header = newElement('div', ['header'])

    const title = newElement('div', ['title'])
    title.textContent = entry.title
    header.appendChild(title)

    const meta = newElement('div', ['meta'])
    
    const pubdate = newElement('span', ['pubdate'])
    pubdate.textContent = dateShort
    pubdate.title = dateLong

    const source = newElement('span', ['source'])
    source.dataset.post = entry.id
    source.textContent = entry.feed

    const original = newElement('a', ['original'])
    original.href = entry.url
    original.target = '_blank'
    original.textContent = "→"
    original.addEventListener('click', (e) => {
        e.stopPropagation()
    })
    
    meta.appendChild(source)
    meta.appendChild(pubdate)
    meta.appendChild(original)
    
    header.appendChild(meta)
    content.appendChild(header)

    link.appendChild(content)
    return link
}

render_category = (category) => {

    window.scrollTo({top: 0, behavior: 'auto'})
    activeFeed = category

    const container = newElement('div', ['category'])

    const category_entries = newElement('div', ['category_entries'])
    category.entries.forEach(e => {
        const entry = formatEntry(e)
        category_entries.appendChild(entry)
    })

    container.appendChild(category_entries)
    feed.appendChild(container)

}

categoryList = (cat) => {

    var category = newElement('a', ['navcat'])
    category.textContent = cat
    category.dataset.category = cat
    category.addEventListener('click', categoryHandler)
    nav.appendChild(category)

}

const getData = async () => {

    return  new Promise(async function(resolve, reject) {
        const response = await fetch('entries.json');
        const responseJSON = await response.json();
        data = responseJSON.reduce((a, v) => ({...a, [v.name]:v}), {})
        resolve()
    })

}

getData().then(function() {
    Object.keys(data).forEach(
        category => categoryList(category)
    );
    const firstCategory = Object.keys(data).slice(0,1)[0]
    navUpdate(firstCategory)
    render_category(data[firstCategory])
})