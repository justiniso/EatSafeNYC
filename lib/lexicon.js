

// ('TREMONT', 341)
// ('BEACH', 345)
// ('WESTCHESTER', 345)
// ('FLATBUSH', 357)
// ('ISLAND', 358)
// ('46', 366)
// ('13', 374)
// ('44', 377)
// ('COLUMBUS', 405)
// ('86', 410)
// ('UNION', 415)
// ('PARKWAY', 422)
// ('GRAND', 424)
// ('1', 426)
// ('SECOND', 456)
// ('QUEENS', 468)
// ('6', 469)
// ('4', 476)
// ('ROOSEVELT', 480)
// ('SOUTH', 514)
// ('5', 520)
// ('THIRD', 551)
// ('LEXINGTON', 598)
// ('9', 604)
// ('ST', 606)
// ('PARK', 627)
// ('NORTHERN', 648)
// ('AMSTERDAM', 695)
// ('MADISON', 735)
// ('8', 757)
// ('3', 807)
// ('AVE', 908)
// ('7', 933)
// ('PLACE', 969)
// ('2', 982)
// ('ROAD', 1482)
// ('BROADWAY', 2666)
// ('BOULEVARD', 3912)
// ('WEST', 5023)
// ('EAST', 5795)
// ('STREET', 17008)
// ('AVENUE', 20026)


// Aliases for the most common street names to give a higher probability of a match
var streets = {
    // ave (908) : avenue(20026)
    'ave': 'avenue',

    // st (606) : street (17008)
    'st': 'street',

    // blvd. (40): boulevard()
    // blvd (43): boulevard()

    // st marks (0): saint mark's (47)
    // st. marks (0): saint mark's (47)
    // saint marks (0): saint mark's (47)
    // saintmarks (0): saint mark's (47)
    // st marks place (304)
    

    // lex (0): lexington (598)
    'lex': 'lexington',



    // TODO: pattern match for 50th (\d+th\s+) and split it into "50 th" (or should we remove the "th" ?)
}