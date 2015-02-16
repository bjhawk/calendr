###
# API Methods - Methods to interact with Calendr-specific functionality
###
from datetime import date
from dateutil.relativedelta import relativedelta
import calendar
import common

##
#API Method - add a rule to the database
##
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

##
#API Method - remove a rule from database
#TODO: soft delete?
##
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

##
#API Method - builds calendar data for given year/month
##
def build_calendar(year, month):
    lastDayOfMonth = date(year, month, calendar.monthrange(year, month)[1])
    firstOfMonth = date(year = year, month = month, day = 1)
    weeks = calendar.Calendar(calendar.SUNDAY).monthdayscalendar(year, month)

    ##
    #TODO: implement multiple checkin dates, get the last checkin date before first
    #of given month/year
    #TODO: implement multiple users, currently hardcoded to one.
    ##
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

    # build out rules for time period between last checkin and last day of given month
    rulesByDay = {}
    for rule in rulesData:
        # for rules that have a recurrence rule
        if (rule['interval']):
            currentDay = rule['start']
            while currentDay < lastDayOfMonth:
                # if this date isn't in our rulesByDay dict, create the entry with empty list
                if currentDay.isoformat() not in rulesByDay:
                    rulesByDay[currentDay.isoformat()] = []

                #add this occurence of this rule to the appropriate day entry in our dictionary
                rulesByDay[currentDay.isoformat()].append({'name':rule['name'],'amount':rule['amount']})
                #increment to next day
                currentDay += relativedelta(**{rule['unit']:rule['interval']})

    #calculate starting amount as of first day of month for this calendar
    #iterates from last checkin date to the first of this month, iteratively applying all rules
    #for each day to a running total.
    currentDay = checkin['date']
    originFunds = checkin['amount']
    while currentDay < firstOfMonth:
        if currentDay.isoformat() in rulesByDay:
            for rule in rulesByDay[currentDay.isoformat()]:
                originFunds += rule['amount']
        currentDay += relativedelta(days=1)

    ##
    #Takes reccuring rules data, and builds upon it, creating the final object that is returned
    #TODO: can this be merged with the loop that builds the rules to begin with?
    ##
    rulesCalendar = {}
    runningTotal = originFunds
    for week in weeks:
        for day in week:
            if day > 0 :
                d = date(year=year, month=month, day=day)
                if d >= firstOfMonth:
                    rulesCalendar[d.isoformat()] = {'rules':[], 'total':runningTotal}
                    if d.isoformat() in rulesByDay:
                        for rule in rulesByDay[d.isoformat()]:
                            rulesCalendar[d.isoformat()]['rules'].append(rule) 
                            runningTotal += rule['amount']
                            rulesCalendar[d.isoformat()]['total'] = runningTotal

    return {'year':year, 'month':month, 'weeks': weeks, 'rulesCalendar':rulesCalendar}
