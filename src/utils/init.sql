CREATE TABLE "authUsers" (
    "walletAddress" TEXT UNIQUE NOT NULL,
    "userPass" TEXT NOT NULL,
    "userRole" TEXT NOT NULL DEFAULT 'CLIENT',

    CONSTRAINT "pk_authUsers_walletAddress_userName"
        PRIMARY KEY ("walletAddress"),

    CONSTRAINT "chk_authUsers_userRole_isValidRole"
        CHECK ( "userRole" IN ('CLIENT', 'ADMIN'))
);

CREATE TABLE "fundRaisers" (
    "fundraiserId" SERIAL PRIMARY KEY,
    "fundraiserCreator" TEXT NOT NULL,

    "fundraiserTitle" TEXT NOT NULL,
    "fundraiserDescription" TEXT NOT NULL,

    "fundraiserTarget" MONEY NOT NULL,
    "fundraiserToken" TEXT NOT NULL DEFAULT 'ETH',
    "fundraiserMinDonationAmount" MONEY DEFAULT 1e-10,

    "fundraiserRaisedAmount" MONEY NOT NULL DEFAULT 0,

    "fundraiserContributorCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fk_fundRaisers_fundraiserCreator_authUsers_walletAddress"
        FOREIGN KEY ("fundraiserCreator")
            REFERENCES "authUsers"("walletAddress")
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

CREATE TABLE "fundraiserDonations" (
    "donatedFundraiser" INTEGER NOT NULL,
    "donorAddress" TEXT NOT NULL,
    "donatedAmount" MONEY,

    CONSTRAINT "fk_fundraiserDonations_donatedFundraiser_fundRaisers_fundId"
        FOREIGN KEY ("donatedFundraiser") REFERENCES "fundRaisers"("fundraiserId"),

    CONSTRAINT "fk_fundraiserDonations_donatorAddress_authUsers_walletAddress"
        FOREIGN KEY ("donorAddress") REFERENCES "authUsers"("walletAddress")

);