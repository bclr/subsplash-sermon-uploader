var mysql = require('mysql')
const util = require('util')

const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

const query = util.promisify(connection.query).bind(connection)

const getSermonsSql = `
SELECT
	wp_sb_sermons.title,
	wp_sb_sermons.description as subtitle,
  wp_sb_preachers.name as speaker,
  wp_sb_sermons.datetime as date,
	wp_sb_series.name as series,
	CONCAT(vStart.book_name, ' ', vStart.chapter, ':', vStart.verse) as verseStart,
  CONCAT(vEnd.book_name, ' ', vEnd.chapter, ':', vEnd.verse) as verseEnd,
	wp_sb_series.name as series,
  wp_sb_stuff.name as fileName
FROM truthlo1_volsaq.wp_sb_sermons 
	JOIN truthlo1_volsaq.wp_sb_preachers ON wp_sb_sermons.preacher_id = wp_sb_preachers.id
  JOIN truthlo1_volsaq.wp_sb_series ON wp_sb_sermons.series_id = wp_sb_series.id
  JOIN truthlo1_volsaq.wp_sb_stuff ON wp_sb_sermons.id = wp_sb_stuff.sermon_id
  LEFT JOIN truthlo1_volsaq.wp_sb_books_sermons as vStart ON wp_sb_sermons.id = vStart.sermon_id AND vStart.type = 'start'
  LEFT JOIN truthlo1_volsaq.wp_sb_books_sermons as vEnd ON wp_sb_sermons.id = vEnd.sermon_id AND vEnd.type = 'end';
`
module.exports.getSermons = async function () {
  return await query(getSermonsSql)
}

