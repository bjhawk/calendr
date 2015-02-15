from flask import request
import simplejson as json
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
import calendar
import common

def add_rule(postData):
    if not postData:
        return False

    query = '''
        INSERT INTO
            `calendar`.`rules`
            (
                `user`,
                `name`,
                `amount`,
                `category`,
                `start`,
                `interval`,
                `unit`,
                `note`
                )
        VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
                ) '''
    
    data = (postData['user'], postData['name'], postData['amount'], postData['category'], postData['start'], postData['interval'], postData['unit'], postData['note'])
    return common.db_mutate(query, data) or False

def delete_rule(postData):
    if not postData['ruleId']:
        return False

    query = '''
        DELETE FROM
            `calendar`.`rules`
        WHERE
            `id` = %s
        '''

    return common.db_mutate(query, (postData['ruleId'])) or False

# builds calendar object
def build_calendar(year, month):
    lastDayOfMonth = date(year, month, calendar.monthrange(year, month)[1])

    checkinQuery = '''
        SELECT
            `amount`,
            `date`
        FROM
            `calendar`.`checkins`
        WHERE
            `user` = %s
    '''
    checkinQueryData = (1);
    checkin = common.db_fetchOne(checkinQuery, checkinQueryData);

    rulesQuery = '''
        SELECT
            r.`name`,
            r.`start`,
            r.`interval`,
            r.`unit`,
            (IF(c.`type` = 'debit', -1, 1) * r.`amount`) AS "amount"
        FROM
            `calendar`.`rules` AS r
            JOIN `calendar`.`categories` AS c ON c.`id` = r.`category`
        '''
        # TODO: implement end date for rules, flush out start date functionality
        # -- WHERE
        #     -- r.`start` <= %s
        #     -- r.`end` >= %s
    # rulesQueryData = (checkin['date'].isoformat(), lastDayOfMonth.isoformat())
    rulesQueryData = ()
    rulesData = common.db_fetchAll(rulesQuery, rulesQueryData)

    weeks = calendar.Calendar(calendar.SUNDAY).monthdayscalendar(year, month)


    return str(json.dumps({'rulesData':rulesData}))
    # build out rules for time period between last checkin and last day of given month
    rulesByDay = {}
    for rule in rulesData:
        # for rules that have a recurrence rule
        if (rule['interval']):
            currentDay = checkin['date']
            while currentDay < lastDayOfMonth:
                # if this date isn't in our rulesByDay dict, create the entry with empty list
                if currentDay.isoformat() not in rulesByDay:
                    rulesByDay[currentDay.isoformat()] = []

                #add this occurence of this rule to the appropriate day entry in our dictionary
                rulesByDay[currentDay.isoformat()].append({'name':rule['name'],'amount':rule['amount']})
                #increment to next day
                currentDay += relativedelta(**{rule['unit']:rule['interval']})

    return(json.dumps({'rulesByDay':rulesByDay}))
    firstImportantDay = max(date(year = year, month = month, day = 1), date.today())

    #calculate starting amount as of first important day for this calendr
    currentDay = checkin['date']
    originFunds = checkin['amount']
    while currentDay < firstImportantDay:
        if currentDay.isoformat() in rulesByDay:
            for rule in rulesByDay[currentDay.isoformat()]:
                originFunds += rule['amount']
        currentDay += relativedelta(days=1)

    rulesCalendar = {}
    runningTotal = originFunds
    for week in weeks:
        for day in week:
            d = date(year=year, month=month, day=day)
            if d >= firstImportantDay:
                rulesCalendar[d.isoformat()] = {'rules':[], 'total':runningTotal}
                if d.isoformat() in rulesByDay:
                    for rule in rulesByDay[d.isoformat()]:
                        rulesCalendar[d.isoformat()]['rules'].append(rule) 
                        runningTotal += rule['amount']
                        rulesCalendar[d.isoformat()]['total'] = runningTotal

    returnObject = {'originFunds':originFunds,'rulesByDay':rulesByDay,'rulesCalendar':rulesCalendar}
    return str(json.dumps(returnObject))