CREATE TABLE "authUsers" (
    "walletId" TEXT UNIQUE NOT NULL,
    "userName" TEXT UNIQUE NOT NULL,
    "userPass" TEXT NOT NULL,

    CONSTRAINT "pk_authUsers_walletId_userName"
        PRIMARY KEY ("walletId", "userName")
);

CREATE TABLE "fundRaisers" (
    "fundraiserId" SERIAL PRIMARY KEY,
    "fundraiserCreator" TEXT NOT NULL,

    "fundraiserTitle" TEXT NOT NULL,
    "fundraiserDescription" TEXT NOT NULL,

    "fundraiserTarget" MONEY NOT NULL,
    "fundraiserToken" TEXT NOT NULL DEFAULT 'ETH',

    "fundraiserRaisedAmount" MONEY NOT NULL DEFAULT 0,

    "fundraiserContributorCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fk_fundRaisers_fundraiserCreator_authUsers_userName"
        FOREIGN KEY ("fundraiserCreator")
            REFERENCES "authUsers"("userName")
);

CREATE TABLE "fundraiserUpdates" (
    "updateId" SERIAL,
    "updateFundraiserId" INTEGER NOT NULL,

    "updateTitle" TEXT NOT NULL,
    "updateDescription" TEXT NOT NULL,

    CONSTRAINT "pk_fundraiserUpdates_updateId_updateFundraiserId"
        PRIMARY KEY ("updateId", "updateFundraiserId"),

    CONSTRAINT "fk_fundraiserUpdates_updateFundraiser_fundRaisers_fundraiserId"
        FOREIGN KEY ("updateFundraiserId") REFERENCES "fundRaisers"("fundraiserId")
);

CREATE TABLE "fundraiserMilestones" (
    "milestoneId" SERIAL,
    "milestoneFundraiserId" INTEGER NOT NULL,

    "milestoneAmount" MONEY,


    CONSTRAINT "pk_fundraiserMilestones_milestoneId_milestoneFundraiserId"
        PRIMARY KEY ("milestoneId", "milestoneFundraiserId"),

    CONSTRAINT "fk_fundraiserMilestone_milestoneFundId_fundRaisers_fundraiserId"
        FOREIGN KEY ("milestoneFundraiserId") REFERENCES "fundRaisers"("fundraiserId")

);
