# Calendr
### Jinja2 Templates used by Flask

**layout.html** - Main Template. includes some google-hosted fonts, ~~jquery~~, and main CSS file.
includes links for navigating the current parts of this application. TODO: actual nav bar.
  

**calendar.html** - The calendar view. Data is built by API and put into JSON 
object in the template. Extends layout.html. Includes it's own CSS file.
  
**manage.html** - List view of all rules. Includes a JSX file that implements auto-populated and updated list,
as well a form for adding rules.
  
**report.html** - A view that uses HTRAF to show breakdown of debits by category, currently not quite accurate  
TODO: use API to build result set, instead of raw HTSQL, to calculate rule repetition before summing values.


**calmock.html** - The original static HTML mockup of the calendar view


**htraftest.html** - A small test template to test HTRAF inclusion. helped debug a jquery issue (missing $.browser from updated version)
  
