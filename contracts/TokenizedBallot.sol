// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IERC20Votes{
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract TokenizedBallot {
    uint256 public referenceBlock;
    IERC20Votes public tokenContract;

    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    Proposal[] public proposals;
    mapping(address => uint256) public votingPowerSpent;

    constructor(
        bytes32[] memory proposalNames, 
        address _tokenContract, 
        uint256 _referenceBlock) {
            for (uint256 i = 0; i < proposalNames.length; i++) {
                proposals.push(Proposal({
                    voteCount: 0,
                    name: proposalNames[i] 
                }));
            }
            tokenContract = IERC20Votes(_tokenContract);
            referenceBlock = _referenceBlock;
    }

    // voting function
    function vote(uint256 proposal, uint256 amount) public {
        // require(block.number > referenceBlock, "Voting has not started yet");
        // require(block.number < referenceBlock + 100, "Voting has ended");
        // require(tokenContract.balanceOf(msg.sender) > 0, "You must own tokens to vote");
        uint256 _votingPower = votingPower(msg.sender);
        require(_votingPower >= amount, "You must own tokens to vote");
        votingPowerSpent[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
    }

    // voting power
    function votingPower(address account) public view returns (uint256 _votingPower) {
       _votingPower = tokenContract.getPastVotes(account, referenceBlock) - votingPowerSpent[msg.sender];
    }

    // winning proposal
    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    // winning name
    function winnerName() public view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}